"""
Migration script: Dossiers (Expedientes) system.
Creates dossiers table, adds dossier_id/code columns to quotations/reservations,
and backfills existing data.

Usage: uv run --with psycopg2-binary python backend/migrate_dossiers.py
"""
import psycopg2
from datetime import datetime

DB_URL = (
    "host=aws-0-us-east-2.pooler.supabase.com port=6543 "
    "dbname=postgres user=postgres.wbygsofkwldfpjcxnuoz "
    "password=Krbu_Vj3s_DB#2026"
)

conn = psycopg2.connect(DB_URL, connect_timeout=15)
conn.autocommit = True
cur = conn.cursor()

YEAR = str(datetime.utcnow().year)

# ── Step 1: Create dossiers table ──
print("[1/4] Creating dossiers table...")
cur.execute("""
    CREATE TABLE IF NOT EXISTS dossiers (
        id VARCHAR PRIMARY KEY,
        code VARCHAR UNIQUE NOT NULL,
        client_id VARCHAR NOT NULL REFERENCES clients(id),
        status VARCHAR NOT NULL DEFAULT 'abierto',
        created_by VARCHAR REFERENCES users(id),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
""")
cur.execute("CREATE INDEX IF NOT EXISTS ix_dossiers_code ON dossiers(code);")
cur.execute("CREATE INDEX IF NOT EXISTS ix_dossiers_client_id ON dossiers(client_id);")
print("  ✓ dossiers table ready")

# ── Step 2: Add columns to quotations ──
print("[2/4] Adding dossier_id + code to quotations...")
cur.execute("ALTER TABLE quotations ADD COLUMN IF NOT EXISTS dossier_id VARCHAR REFERENCES dossiers(id);")
cur.execute("ALTER TABLE quotations ADD COLUMN IF NOT EXISTS code VARCHAR;")
cur.execute("CREATE INDEX IF NOT EXISTS ix_quotations_dossier_id ON quotations(dossier_id);")
cur.execute("CREATE INDEX IF NOT EXISTS ix_quotations_code ON quotations(code);")
print("  ✓ quotations columns ready")

# ── Step 3: Add columns to reservations ──
print("[3/4] Adding dossier_id + code to reservations...")
cur.execute("ALTER TABLE reservations ADD COLUMN IF NOT EXISTS dossier_id VARCHAR REFERENCES dossiers(id);")
cur.execute("ALTER TABLE reservations ADD COLUMN IF NOT EXISTS code VARCHAR;")
cur.execute("CREATE INDEX IF NOT EXISTS ix_reservations_dossier_id ON reservations(dossier_id);")
cur.execute("CREATE INDEX IF NOT EXISTS ix_reservations_code ON reservations(code);")
print("  ✓ reservations columns ready")

# ── Step 4: Backfill existing quotations ──
print("[4/4] Backfilling existing quotations...")
cur.execute("SELECT id, client_id, created_at FROM quotations WHERE dossier_id IS NULL ORDER BY created_at ASC;")
orphans = cur.fetchall()
print(f"  Found {len(orphans)} quotations without dossier")

exp_counter = 1
cot_counter = 1

for qid, client_id, created_at in orphans:
    year = created_at.strftime("%Y") if created_at else YEAR
    exp_code = f"EXP-{year}-{exp_counter:05d}"
    cot_code = f"COT-{year}-{cot_counter:05d}"
    exp_id = f"exp-mig-{qid[:8]}"

    # Insert dossier
    cur.execute(
        "INSERT INTO dossiers (id, code, client_id, status, created_at, updated_at) "
        "VALUES (%s, %s, %s, 'abierto', %s, %s) "
        "ON CONFLICT (id) DO NOTHING;",
        (exp_id, exp_code, client_id, created_at or datetime.utcnow(), datetime.utcnow())
    )

    # Update quotation
    cur.execute(
        "UPDATE quotations SET dossier_id = %s, code = %s WHERE id = %s;",
        (exp_id, cot_code, qid)
    )

    exp_counter += 1
    cot_counter += 1

print(f"  ✓ Backfilled {len(orphans)} quotations with dossiers and codes")

# ── Count existing reservations that need backfill ──
cur.execute("SELECT COUNT(*) FROM reservations WHERE dossier_id IS NULL;")
res_count = cur.fetchone()[0]
if res_count > 0:
    print(f"  ℹ Found {res_count} reservations without dossier (will link via quotation)")
    # For reservations with a quotation_id, copy dossier from that quotation
    cur.execute("""
        UPDATE reservations r
        SET dossier_id = q.dossier_id
        FROM quotations q
        WHERE r.quotation_id = q.id AND r.dossier_id IS NULL AND q.dossier_id IS NOT NULL;
    """)
    # For reservations without a quotation, leave as-is (manual review)
    cur.execute("SELECT COUNT(*) FROM reservations WHERE dossier_id IS NULL;")
    remaining = cur.fetchone()[0]
    if remaining > 0:
        print(f"  ⚠ {remaining} reservations still without dossier (no quotation linked)")

cur.close()
conn.close()
print("\n✅ Migration complete!")

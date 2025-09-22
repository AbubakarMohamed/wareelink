<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::unprepared("
            CREATE TRIGGER after_user_insert
            AFTER INSERT ON users
            FOR EACH ROW
            BEGIN
                IF NEW.role = 'company' THEN
                    INSERT INTO companies (user_id, name, registration_no, status, created_at, updated_at)
                    VALUES (
                        NEW.id,
                        NEW.name,
                        CONCAT('REG-', LPAD(NEW.id, 6, '0')),
                        'active',
                        NOW(),
                        NOW()
                    );
                END IF;
            END
        ");
    }

    public function down(): void
    {
        DB::unprepared('DROP TRIGGER IF EXISTS after_user_insert');
    }
};

<?php

namespace Database\Seeders;

use App\Models\WallboardSetting;
use Illuminate\Database\Seeder;

class WallboardSeeder extends Seeder
{
    public function run(): void
    {
        $defaults = WallboardSetting::getDefaults();

        foreach ($defaults as $key => $value) {
            WallboardSetting::updateOrCreate(
                ['key' => $key],
                ['value' => $value]
            );
        }
    }
}

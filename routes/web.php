<?php

use App\Http\Controllers\Admin\AdminTicketController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SuperAdmin\BranchController;
use App\Http\Controllers\SuperAdmin\ModuleController;
use App\Http\Controllers\TicketCommentController;
use App\Http\Controllers\TicketController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

Route::get('/', function () {
    if (auth()->check()) {
        // Logged in users go to ticket creation
        return redirect()->route('tickets.create');
    }
    // Guests go to login
    return redirect()->route('login');
});

use App\Http\Controllers\DashboardController;

Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

/*
|--------------------------------------------------------------------------
| User Routes (Ticket Submission)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth'])->group(function () {
    // Ticket creation
    Route::get('/tickets/create', [TicketController::class, 'create'])->name('tickets.create');
    Route::post('/tickets', [TicketController::class, 'store'])->name('tickets.store');
    
    // My Tickets
    Route::get('/my/tickets', [TicketController::class, 'myTickets'])->name('my.tickets');
    Route::get('/my/tickets/{ticket}', [TicketController::class, 'show'])->name('my.tickets.show');
    Route::post('/my/tickets/{ticket}/comments', [TicketCommentController::class, 'store'])->name('my.tickets.comments.store');
    Route::post('/my/tickets/{ticket}/confirm-fixed', [TicketController::class, 'confirmFixed'])->name('my.tickets.confirmFixed');
    Route::post('/my/tickets/{ticket}/not-fixed', [TicketController::class, 'notFixed'])->name('my.tickets.notFixed');

    // Knowledge Base (user-facing)
    Route::get('/kb', [\App\Http\Controllers\KnowledgeBaseController::class, 'index'])->name('kb.index');
    Route::get('/kb/suggestions', [\App\Http\Controllers\KnowledgeBaseController::class, 'suggestions'])->name('kb.suggestions');
    Route::get('/kb/{slug}', [\App\Http\Controllers\KnowledgeBaseController::class, 'show'])->name('kb.show');
});

/*
|--------------------------------------------------------------------------
| Admin Routes
|--------------------------------------------------------------------------
*/

Route::middleware(['auth', 'role:admin,super_admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/tickets', [AdminTicketController::class, 'index'])->name('tickets.index');
    Route::get('/tickets/create', [AdminTicketController::class, 'create'])->name('tickets.create');
    Route::post('/tickets', [AdminTicketController::class, 'store'])->name('tickets.store');
    Route::get('/users/search', [AdminTicketController::class, 'searchUsers'])->name('users.search');
    Route::get('/tickets/{ticket}', [AdminTicketController::class, 'show'])->name('tickets.show');
    Route::patch('/tickets/{ticket}/status', [AdminTicketController::class, 'updateStatus'])->name('tickets.updateStatus');
    Route::patch('/tickets/{ticket}/assign', [AdminTicketController::class, 'assignUser'])->name('tickets.assignUser');
    Route::patch('/tickets/{ticket}/priority', [AdminTicketController::class, 'updatePriority'])->name('tickets.updatePriority');
    Route::post('/tickets/{ticket}/comments', [TicketCommentController::class, 'store'])->name('tickets.comments.store');
    
    // Kanban Route
    Route::get('/kanban', [AdminTicketController::class, 'kanban'])->name('kanban');

    // Reports Routes
    Route::get('/reports', [App\Http\Controllers\Admin\ReportsController::class, 'index'])->name('reports.index');
    Route::get('/reports/summary', [App\Http\Controllers\Admin\ReportsController::class, 'summary'])->name('reports.summary');
    Route::get('/reports/volume', [App\Http\Controllers\Admin\ReportsController::class, 'volume'])->name('reports.volume');
    Route::get('/reports/breakdowns', [App\Http\Controllers\Admin\ReportsController::class, 'breakdowns'])->name('reports.breakdowns');
    Route::get('/reports/performance', [App\Http\Controllers\Admin\ReportsController::class, 'performance'])->name('reports.performance');
    Route::get('/reports/export/csv', [App\Http\Controllers\Admin\ReportsController::class, 'exportCsv'])->name('reports.export.csv');
    Route::get('/reports/export/summary-csv', [App\Http\Controllers\Admin\ReportsController::class, 'exportSummaryCsv'])->name('reports.export.summaryCsv');
});

/*
|--------------------------------------------------------------------------
| Super Admin Routes
|--------------------------------------------------------------------------
*/
use App\Http\Controllers\SuperAdmin\NotificationSettingsController;
use App\Http\Controllers\SuperAdmin\EmailTemplateController;
use App\Http\Controllers\SuperAdmin\WallboardSettingsController;
use App\Http\Controllers\SuperAdmin\UserController;

Route::middleware(['auth', 'role:super_admin'])->prefix('superadmin')->name('superadmin.')->group(function () {
    // Branch management
    Route::get('/branches', [BranchController::class, 'index'])->name('branches.index');
    Route::post('/branches', [BranchController::class, 'store'])->name('branches.store');
    Route::put('/branches/{branch}', [BranchController::class, 'update'])->name('branches.update');
    Route::patch('/branches/{branch}/toggle', [BranchController::class, 'toggle'])->name('branches.toggle');
    
    // User management
    Route::resource('users', UserController::class);

    // Module management
    Route::get('/modules', [ModuleController::class, 'index'])->name('modules.index');
    Route::post('/modules', [ModuleController::class, 'store'])->name('modules.store');
    Route::put('/modules/{module}', [ModuleController::class, 'update'])->name('modules.update');
    Route::patch('/modules/{module}/toggle', [ModuleController::class, 'toggle'])->name('modules.toggle');

    // Notification settings
    Route::get('/notifications', [NotificationSettingsController::class, 'index'])->name('notifications.index');
    Route::patch('/notifications/{key}', [NotificationSettingsController::class, 'update'])->name('notifications.update');

    // Email templates
    Route::get('/email-templates', [EmailTemplateController::class, 'index'])->name('templates.index');
    Route::put('/email-templates/{key}', [EmailTemplateController::class, 'update'])->name('templates.update');

    // Wallboard settings
    Route::get('/wallboard', [WallboardSettingsController::class, 'index'])->name('wallboard.index');
    Route::put('/wallboard', [WallboardSettingsController::class, 'update'])->name('wallboard.update');
    Route::post('/wallboard/signed-link', [WallboardSettingsController::class, 'generateSignedLink'])->name('wallboard.signedLink');

    // Knowledge Base Management
    Route::get('/kb', [\App\Http\Controllers\SuperAdmin\KnowledgeBaseController::class, 'index'])->name('kb.index');
    Route::get('/kb/create', [\App\Http\Controllers\SuperAdmin\KnowledgeBaseController::class, 'create'])->name('kb.create');
    Route::post('/kb', [\App\Http\Controllers\SuperAdmin\KnowledgeBaseController::class, 'store'])->name('kb.store');
    Route::get('/kb/{article}', [\App\Http\Controllers\SuperAdmin\KnowledgeBaseController::class, 'show'])->name('kb.show');
    Route::get('/kb/{article}/edit', [\App\Http\Controllers\SuperAdmin\KnowledgeBaseController::class, 'edit'])->name('kb.edit');
    Route::put('/kb/{article}', [\App\Http\Controllers\SuperAdmin\KnowledgeBaseController::class, 'update'])->name('kb.update');
    Route::delete('/kb/{article}', [\App\Http\Controllers\SuperAdmin\KnowledgeBaseController::class, 'destroy'])->name('kb.destroy');
    Route::patch('/kb/{article}/toggle-published', [\App\Http\Controllers\SuperAdmin\KnowledgeBaseController::class, 'togglePublished'])->name('kb.togglePublished');
    Route::patch('/kb/{article}/toggle-featured', [\App\Http\Controllers\SuperAdmin\KnowledgeBaseController::class, 'toggleFeatured'])->name('kb.toggleFeatured');

    // SLA Policies
    Route::get('/sla-policies', [\App\Http\Controllers\SuperAdmin\SlaPoliciesController::class, 'index'])->name('sla.index');
    Route::post('/sla-policies', [\App\Http\Controllers\SuperAdmin\SlaPoliciesController::class, 'store'])->name('sla.store');
    Route::put('/sla-policies/{slaPolicy}', [\App\Http\Controllers\SuperAdmin\SlaPoliciesController::class, 'update'])->name('sla.update');
    Route::delete('/sla-policies/{slaPolicy}', [\App\Http\Controllers\SuperAdmin\SlaPoliciesController::class, 'destroy'])->name('sla.destroy');
    Route::post('/sla-policies/backfill', [\App\Http\Controllers\SuperAdmin\SlaPoliciesController::class, 'backfill'])->name('sla.backfill');
});

/*
|--------------------------------------------------------------------------
| Signed Email Action Routes (No Auth Required)
|--------------------------------------------------------------------------
*/
use App\Http\Controllers\SignedTicketActionController;

Route::get('/tickets/{ticket}/confirm-fixed', [SignedTicketActionController::class, 'confirmFixed'])->name('tickets.confirmFixed.signed');
Route::get('/tickets/{ticket}/not-fixed', [SignedTicketActionController::class, 'notFixed'])->name('tickets.notFixed.signed');

/*
|--------------------------------------------------------------------------
| Wallboard Routes (Signed URL Access - No Auth Required)
|--------------------------------------------------------------------------
*/
use App\Http\Controllers\WallboardController;

Route::get('/wallboard', [WallboardController::class, 'index'])->name('wallboard');
Route::get('/api/wallboard/tickets', [WallboardController::class, 'tickets'])->name('api.wallboard.tickets');

require __DIR__.'/auth.php';

Route::get('/clear-all-cache', function() {
    \Illuminate\Support\Facades\Artisan::call('optimize:clear');
    \Illuminate\Support\Facades\Artisan::call('route:clear');
    \Illuminate\Support\Facades\Artisan::call('config:clear');
    \Illuminate\Support\Facades\Artisan::call('view:clear');
    return 'All caches cleared successfully!';
});

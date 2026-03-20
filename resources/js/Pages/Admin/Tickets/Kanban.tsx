import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { PageProps, Ticket, Branch, Module, User } from '@/types';
import { useState, useEffect } from 'react';
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragStartEvent,
    DragOverEvent,
    DragEndEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import KanbanColumn from '@/Components/KanbanColumn';
import KanbanCard from '@/Components/KanbanCard';

interface Props extends PageProps {
    tickets: Ticket[];
    branches: Pick<Branch, 'id' | 'name'>[];
    modules: Pick<Module, 'id' | 'name'>[];
    admins: Pick<User, 'id' | 'name'>[];
    filters: {
        branch_id?: string;
        module_id?: string;
        search?: string;
        assigned_admin_id?: string;
    };
}

const STATUSES = ['NEW', 'ASSIGNED', 'IN_PROGRESS', 'WAITING_USER', 'WAITING_VENDOR', 'RESOLVED', 'CLOSED'];

const STATUS_COLORS: Record<string, string> = {
    NEW: 'border-blue-500',
    ASSIGNED: 'border-indigo-500',
    IN_PROGRESS: 'border-yellow-500',
    WAITING_USER: 'border-orange-500',
    WAITING_VENDOR: 'border-purple-500',
    RESOLVED: 'border-green-500',
    CLOSED: 'border-gray-500',
};

export default function Kanban({ auth, tickets, branches, modules, admins, filters }: Props) {
    const [columns, setColumns] = useState<Record<string, Ticket[]>>({});
    const [activeId, setActiveId] = useState<string | null>(null);
    const [search, setSearch] = useState(filters.search || '');

    // Modal states
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [showNoteModal, setShowNoteModal] = useState(false);
    const [pendingMove, setPendingMove] = useState<{ ticket: Ticket; from: string; to: string } | null>(null);
    const [selectedAdminId, setSelectedAdminId] = useState('');
    const [transitionNote, setTransitionNote] = useState('');

    useEffect(() => {
        const isTicketOverdue = (t: Ticket) => {
            const now = new Date();
            const frOverdue = t.first_response_due_at && !t.first_admin_action_at && now > new Date(t.first_response_due_at);
            const resOverdue = t.resolution_due_at && !t.resolved_at && now > new Date(t.resolution_due_at);
            return frOverdue || resOverdue;
        };

        const grouped = STATUSES.reduce((acc, status) => {
            const col = tickets.filter((t) => t.status === status);
            // Sort: overdue tickets first, then by created_at desc
            col.sort((a, b) => {
                const aOverdue = isTicketOverdue(a) ? 1 : 0;
                const bOverdue = isTicketOverdue(b) ? 1 : 0;
                if (bOverdue !== aOverdue) return bOverdue - aOverdue;
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            });
            acc[status] = col;
            return acc;
        }, {} as Record<string, Ticket[]>);
        setColumns(grouped);
    }, [tickets]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleFilter = (key: string, value: string) => {
        router.get(route('admin.kanban'), {
            ...filters,
            [key]: value || undefined,
        }, { preserveState: true });
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        handleFilter('search', search);
    };

    const findContainer = (id: string) => {
        if (id in columns) return id;
        return Object.keys(columns).find((key) => columns[key].find((t) => t.id.toString() === id));
    };

    const isBackwardMove = (from: string, to: string): boolean => {
        return STATUSES.indexOf(to) < STATUSES.indexOf(from);
    };

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragOver = (event: DragOverEvent) => {
        // Preview handled by DndContext
    };

    const executeMove = (ticket: Ticket, from: string, to: string, note?: string, assignAdminId?: string) => {
        // Optimistic Update
        setColumns((prev) => {
            const next = { ...prev };
            next[from] = prev[from].filter((t) => t.id.toString() !== ticket.id.toString());
            next[to] = [...prev[to], { ...ticket, status: to }];
            return next;
        });

        const revertMove = () => {
            setColumns((prev) => {
                const next = { ...prev };
                next[to] = prev[to].filter((t) => t.id.toString() !== ticket.id.toString());
                next[from] = [...prev[from], ticket];
                return next;
            });
        };

        const data: Record<string, any> = { status: to };
        if (note) data.note = note;

        // If assigning, call assign endpoint first
        if (assignAdminId) {
            router.visit(route('admin.tickets.assignUser', ticket.id), {
                method: 'patch',
                data: { assigned_admin_id: assignAdminId },
                preserveScroll: true,
                preserveState: false,
                onSuccess: () => {
                    // Then update status
                    router.visit(route('admin.tickets.updateStatus', ticket.id), {
                        method: 'patch',
                        data: data,
                        preserveScroll: true,
                        preserveState: false,
                        onError: () => {
                            revertMove();
                            alert('Failed to update status.');
                        }
                    });
                },
                onError: () => {
                    revertMove();
                    alert('Failed to assign admin.');
                }
            });
        } else {
            // Just update status
            router.visit(route('admin.tickets.updateStatus', ticket.id), {
                method: 'patch',
                data: data,
                preserveScroll: true,
                preserveState: false,
                onError: (errors) => {
                    console.error('Update status error:', errors);
                    revertMove();
                    alert('Failed to update status. Please try again.');
                }
            });
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        const activeIdStr = active.id as string;
        const overId = over?.id as string;

        if (!overId) {
            setActiveId(null);
            return;
        }

        const activeContainer = findContainer(activeIdStr);
        const overContainer = findContainer(overId) || (STATUSES.includes(overId) ? overId : null);

        if (activeContainer && overContainer && activeContainer !== overContainer) {
            const activeItem = columns[activeContainer].find((t) => t.id.toString() === activeIdStr);

            if (activeItem) {
                // Rule 1: Cannot move from NEW without assigning
                if (activeContainer === 'NEW' && !activeItem.assigned_admin_id) {
                    setPendingMove({ ticket: activeItem, from: activeContainer, to: overContainer });
                    setShowAssignModal(true);
                    setActiveId(null);
                    return;
                }

                // Rule 2: Moving from CLOSED or backward requires note
                if (activeContainer === 'CLOSED' || isBackwardMove(activeContainer, overContainer)) {
                    setPendingMove({ ticket: activeItem, from: activeContainer, to: overContainer });
                    setShowNoteModal(true);
                    setActiveId(null);
                    return;
                }

                // Normal move
                executeMove(activeItem, activeContainer, overContainer);
            }
        }

        setActiveId(null);
    };

    const handleAssignAndMove = () => {
        if (!pendingMove || !selectedAdminId) return;

        executeMove(pendingMove.ticket, pendingMove.from, pendingMove.to, undefined, selectedAdminId);

        setShowAssignModal(false);
        setPendingMove(null);
        setSelectedAdminId('');
    };

    const handleNoteAndMove = () => {
        if (!pendingMove || !transitionNote.trim()) return;

        executeMove(pendingMove.ticket, pendingMove.from, pendingMove.to, transitionNote);

        setShowNoteModal(false);
        setPendingMove(null);
        setTransitionNote('');
    };

    const cancelModal = () => {
        setShowAssignModal(false);
        setShowNoteModal(false);
        setPendingMove(null);
        setSelectedAdminId('');
        setTransitionNote('');
    };

    const activeTicket = activeId ? tickets.find((t) => t.id.toString() === activeId) : null;

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-bold text-xl text-white dark:text-white light:text-gray-900 leading-tight">Ticket Board</h2>}
        >
            <Head title="Kanban Board" />

            <div className="py-6 h-[calc(100vh-4rem)] flex flex-col overflow-hidden">
                <div className="max-w-[1920px] w-full mx-auto px-4 sm:px-6 lg:px-8 flex-1 flex flex-col min-h-0">
                    {/* Filters */}
                    <div className="mb-6 bg-white/5 border border-white/10 backdrop-blur-md p-4 rounded-2xl flex flex-wrap gap-4 items-center shadow-glass">
                        <form onSubmit={handleSearch} className="flex shadow-lg rounded-lg overflow-hidden group">
                            <input
                                type="text"
                                placeholder="Search tickets..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-40 md:w-64 bg-black/20 border-0 text-white dark:text-white light:text-gray-900 placeholder-gray-400 focus:ring-0 text-sm py-2.5 px-4 transition-all"
                            />
                            <button
                                type="submit"
                                className="px-4 bg-indigo-600 text-white dark:text-white light:text-gray-900 hover:bg-indigo-500 transition-colors flex items-center justify-center"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            </button>
                        </form>

                        <select
                            value={filters.branch_id || ''}
                            onChange={(e) => handleFilter('branch_id', e.target.value)}
                            className="bg-black/20 border border-white/10 text-white dark:text-white light:text-gray-900 rounded-xl shadow-sm text-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer hover:bg-white/10 transition-colors"
                        >
                            <option value="" className="bg-gray-800">All Branches</option>
                            {branches.map((b) => <option key={b.id} value={b.id} className="bg-gray-800">{b.name}</option>)}
                        </select>

                        <select
                            value={filters.module_id || ''}
                            onChange={(e) => handleFilter('module_id', e.target.value)}
                            className="bg-black/20 border border-white/10 text-white dark:text-white light:text-gray-900 rounded-xl shadow-sm text-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer hover:bg-white/10 transition-colors"
                        >
                            <option value="" className="bg-gray-800">All Modules</option>
                            {modules.map((m) => <option key={m.id} value={m.id} className="bg-gray-800">{m.name}</option>)}
                        </select>

                        <select
                            value={filters.assigned_admin_id || ''}
                            onChange={(e) => handleFilter('assigned_admin_id', e.target.value)}
                            className="bg-black/20 border border-white/10 text-white dark:text-white light:text-gray-900 rounded-xl shadow-sm text-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer hover:bg-white/10 transition-colors"
                        >
                            <option value="" className="bg-gray-800">All Admins</option>
                            <option value="unassigned" className="bg-gray-800">Unassigned</option>
                            {admins.map((a) => <option key={a.id} value={a.id} className="bg-gray-800">{a.name}</option>)}
                        </select>

                        <div className="flex-1 text-right flex justify-end gap-3">
                            <a
                                href={route('admin.tickets.create')}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-accent-blue/20 hover:bg-accent-blue/30 border border-accent-blue/30 text-accent-blue rounded-xl text-sm font-medium transition-all hover:scale-105"
                            >
                                + Create Ticket
                            </a>
                            <a
                                href={route('admin.tickets.index')}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm text-white dark:text-white light:text-gray-900 font-medium transition-all hover:scale-105"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
                                List View
                            </a>
                        </div>
                    </div>

                    {/* Board */}
                    <div className="flex-1 min-h-0 relative">
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCorners}
                            onDragStart={handleDragStart}
                            onDragOver={handleDragOver}
                            onDragEnd={handleDragEnd}
                        >
                            <div className="absolute inset-0 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                                <div className="flex space-x-6 min-w-max h-full pb-2 px-2 pr-8">
                                    {STATUSES.map((status) => (
                                        <KanbanColumn
                                            key={status}
                                            id={status}
                                            title={status.replaceAll('_', ' ')}
                                            tickets={columns[status] || []}
                                            color={STATUS_COLORS[status]}
                                        />
                                    ))}
                                </div>
                            </div>
                            <DragOverlay>
                                {activeTicket ? <KanbanCard ticket={activeTicket} /> : null}
                            </DragOverlay>
                        </DndContext>
                    </div>
                </div>
            </div>

            {/* Assignment Modal */}
            {showAssignModal && pendingMove && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
                    <div className="glass-card w-full max-w-md p-6 m-4 shadow-glass-lg scale-100 animate-slide-up">
                        <h3 className="text-lg font-bold mb-4 text-indigo-400">Assign Admin Required</h3>
                        <p className="mb-6 text-gray-300 dark:text-gray-300 light:text-gray-700">
                            This ticket must be assigned to an admin before moving from NEW.
                        </p>
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-400 dark:text-gray-400 light:text-gray-600 mb-2">
                                Select Admin <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={selectedAdminId}
                                onChange={(e) => setSelectedAdminId(e.target.value)}
                                className="input-dark w-full"
                            >
                                <option value="" className="bg-gray-800">Select an admin...</option>
                                {admins.map((admin) => (
                                    <option key={admin.id} value={admin.id} className="bg-gray-800">{admin.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={cancelModal}
                                className="px-4 py-2 text-gray-400 dark:text-gray-400 light:text-gray-600 hover:text-white dark:text-white light:text-gray-900 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAssignAndMove}
                                disabled={!selectedAdminId}
                                className="btn-primary"
                            >
                                Assign & Move
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Note Required Modal */}
            {showNoteModal && pendingMove && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
                    <div className="glass-card w-full max-w-md p-6 m-4 shadow-glass-lg scale-100 animate-slide-up">
                        <h3 className="text-lg font-bold mb-4 text-orange-400">
                            {pendingMove.from === 'CLOSED' ? 'Reopening Ticket' : 'Moving Backward'}
                        </h3>
                        <p className="mb-6 text-gray-300 dark:text-gray-300 light:text-gray-700">
                            {pendingMove.from === 'CLOSED'
                                ? 'Please provide a reason for reopening this ticket.'
                                : `Moving ticket from ${pendingMove.from} back to ${pendingMove.to}. Please explain why.`}
                        </p>
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-400 dark:text-gray-400 light:text-gray-600 mb-2">
                                Note <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={transitionNote}
                                onChange={(e) => setTransitionNote(e.target.value)}
                                rows={3}
                                className="textarea-dark w-full"
                                placeholder="Reason for this change..."
                            />
                        </div>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={cancelModal}
                                className="px-4 py-2 text-gray-400 dark:text-gray-400 light:text-gray-600 hover:text-white dark:text-white light:text-gray-900 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleNoteAndMove}
                                disabled={!transitionNote.trim()}
                                className="btn-primary"
                            >
                                Confirm Move
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}

export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at: string;
    role: 'super_admin' | 'admin' | 'user';
}

export interface Branch {
    id: number;
    name: string;
    code: string | null;
    is_head_office: boolean;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface Module {
    id: number;
    name: string;
    description: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface TicketAttachment {
    id: number;
    ticket_id: number;
    original_name: string;
    path: string;
    mime_type: string;
    size_bytes: number;
    uploaded_by_user_id: number;
    created_at: string;
}

export interface TicketStatusHistory {
    id: number;
    ticket_id: number;
    from_status: string | null;
    to_status: string;
    changed_by_user_id: number;
    note: string | null;
    created_at: string;
    user?: User;
}

export interface TicketComment {
    id: number;
    ticket_id: number;
    author_user_id: number;
    visibility: 'PUBLIC' | 'INTERNAL';
    body: string;
    created_at: string;
    updated_at: string;
    user?: User;
}

export interface RequestType {
    id: number;
    name: string;
    description?: string;
    module_id?: number;
    is_active: boolean;
    module?: Module;
    fields?: RequestField[];
}

export interface RequestField {
    id: number;
    request_type_id: number;
    label: string;
    field_type: 'text' | 'textarea' | 'select' | 'checkbox' | 'file';
    options?: string[];
    is_required: boolean;
    order: number;
}

export interface ReplyTemplate {
    id: number;
    title: string;
    body: string;
    module_id?: number;
    created_by_user_id: number;
    module?: Module;
    creator?: User;
}

export interface Vendor {
    id: number;
    name: string;
    contact_email?: string;
    contact_phone?: string;
    notes?: string;
}

export interface Asset {
    id: number;
    asset_tag: string;
    type: string;
    branch_id?: number;
    assigned_to_user_id?: number;
    hostname?: string;
    ip_address?: string;
    anydesk_code?: string;
    branch?: Branch;
    assignedUser?: User;
}

export interface AuditLog {
    id: number;
    actor_user_id?: number;
    action: string;
    target_type?: string;
    target_id?: number;
    meta?: any;
    created_at: string;
    actor?: User;
}

export interface KnowledgeArticle {
    id: number;
    title: string;
    slug: string;
    module_id?: number;
    summary: string;
    body: string;
    is_published: boolean;
    is_featured: boolean;
    created_by_user_id: number;
    updated_by_user_id?: number;
    created_at: string;
    updated_at: string;
    module?: Module;
    creator?: User;
    updater?: User;
    views_count?: number;
}

export interface KnowledgeArticleView {
    id: number;
    article_id: number;
    user_id?: number;
    viewed_at: string;
    article?: KnowledgeArticle;
    user?: User;
}

export interface Ticket {
    id: number;
    ticket_no: string;
    created_by_user_id: number;
    branch_id: number;
    module_id: number;
    phone: string;
    issue_description: string;
    ip_address: string | null;
    anydesk_code: string | null;
    status: string;
    priority?: string;
    assigned_admin_id?: number;
    resolved_at?: string;
    closed_at?: string;
    first_admin_action_at?: string | null;
    first_response_due_at?: string | null;
    resolution_due_at?: string | null;
    first_response_breached_at?: string | null;
    resolution_breached_at?: string | null;
    created_at: string;
    updated_at: string;
    creator?: User;
    branch?: Branch;
    module?: Module;
    assigned_admin?: User;
    attachments?: TicketAttachment[];
    history?: TicketStatusHistory[];
    comments?: TicketComment[];
}

export interface PaginatedData<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
}

export type PageProps<T extends Record<string, unknown> = Record<string, unknown>> = T & {
    auth: {
        user: User;
    };
    flash?: {
        success?: string;
        error?: string;
    };
};


import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const TENANT_ID = '612d5347-5745-4b4a-b69c-70087e6a7e8b'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function createInitialLead() {
    const { data, error } = await supabase
        .from('leads')
        .insert([
            {
                name: 'Nuevo Paciente (Chat)',
                status: 'New',
                tenant_id: TENANT_ID,
                created_at: new Date().toISOString()
            },
        ])
        .select()

    if (error) {
        console.error('Error creating initial lead:', error)
        return null
    }
    return data[0]
}

export async function updateLeadInfo(leadId: string, updates: {
    name?: string;
    phone?: string;
    assigned_specialist?: string;
    status?: string;
}) {
    const { data, error } = await supabase
        .from('leads')
        .update(updates)
        .eq('id', leadId)
        .select()

    if (error) {
        console.error('Error updating lead:', error)
        return null
    }
    return data[0]
}

export async function saveChatMessage(leadId: string, role: 'user' | 'assistant', content: string) {
    const { data, error } = await supabase
        .from('messages')
        .insert([
            {
                lead_id: leadId,
                role: role,
                content: content,
                tenant_id: TENANT_ID,
                created_at: new Date().toISOString()
            },
        ])
        .select()

    if (error) {
        console.error('Error saving message:', error)
        return null
    }
    return data[0]
}

// Deprecated in favor of the more granular functions above, but kept for compatibility
export async function saveTriageLead(lead: { name: string; phone: string; reason: string; specialist: string }) {
    const { data, error } = await supabase
        .from('leads')
        .insert([
            {
                name: lead.name,
                phone: lead.phone,
                status: 'New',
                assigned_specialist: lead.specialist,
                tenant_id: TENANT_ID,
                created_at: new Date().toISOString()
            },
        ])
        .select()

    if (error) {
        console.error('Error saving lead to Supabase:', error)
        return null
    }
    return data
}

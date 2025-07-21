import { supabase } from "../client";

interface AddHospitalPayload {
    name: string;
    phone: string | null;
    email: string | null;
}

interface UpdateHospitalPayload extends AddHospitalPayload {
    id: number;
}

const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });
    if (error) {
        throw new Error(`Login failed: ${error.message}`);
    }
    return data;
}

const getHospitals = async () => {
    const { data, error } = await supabase
        .from('hospital')
        .select('*');
    if (error) {
        throw new Error(`Get hospitals failed: ${error.message}`);
    }
    return data;
};

const addHospital = async (hospital: AddHospitalPayload) => {
    const { data, error } = await supabase
        .from('hospital')
        .insert([hospital])
        .select()
        .single();

    if (error) {
        throw new Error(`Add hospital failed: ${error.message}`);
    }
    return data;
};

const updateHospital = async (hospital: UpdateHospitalPayload) => {
    const { id, ...updateData } = hospital;
    const { data, error } = await supabase
        .from('hospital')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        throw new Error(`Update hospital failed: ${error.message}`);
    }
    return data;
};

export { addHospital, updateHospital, getHospitals, login };

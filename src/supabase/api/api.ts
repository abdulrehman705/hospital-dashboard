import { supabase } from "../client";

interface AddHospitalPayload {
    name: string;
    phone: string | null;
    email: string | null;
}

interface UpdateHospitalPayload extends AddHospitalPayload {
    id: number;
}

interface AddDoctorPayload {
    first_name: string;
    last_name: string;
    sur_name: string;
    email: string;
    phone_number: string;
    hospital_id: number | null;
    department: string;
    registration_number: string;
}

interface UpdateDoctorPayload extends AddDoctorPayload {
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

const getDoctors = async () => {
    const { data, error } = await supabase
        .from('doctor')
        .select('*');
    if (error) {
        throw new Error(`Get doctors failed: ${error.message}`);
    }
    return data;
};

// add doctor
const addDoctor = async (doctor: AddDoctorPayload) => {
    const { data, error } = await supabase
        .from('doctor')
        .insert([doctor])
        .select()
        .single();

    if (error) {
        throw new Error(`Add doctor failed: ${error.message}`);
    }
    return data;
};

const updateDoctor = async (doctor: UpdateDoctorPayload) => {
    const { id, ...updateData } = doctor;
    const { data, error } = await supabase
        .from('doctor')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        throw new Error(`Update doctor failed: ${error.message}`);
    }
    return data;
};

const getDoctorSessions = async () => {
    const { data, error } = await supabase
        .from('session')
        .select('*');
    if (error) {
        throw new Error(`Get doctor sessions failed: ${error.message}`);
    }
    return data;
};

export {
    addHospital,
    updateHospital,
    getHospitals,
    login,
    getDoctors,
    addDoctor,
    updateDoctor,
    getDoctorSessions
};

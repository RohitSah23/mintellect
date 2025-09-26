"use client";
import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useAlert } from "./alertContext";

type User = {
    email: string;
    name?: string;
    orgName?: string;
    phone: string;
    pan?: string;
    cin?: string;
    govId?: string;
    govIdType?: string;
    idType?: string;
    address: string;
    walletAddress: string;
    uid: string;
    role: string;
    org_id?: string;

};

type AuthContextType = {
    user: User | null;
    logout: () => void;
    login: () => void;
    signup: (formData: Partial<User> & { otp: string }) => void;
    isAuthPending: boolean;
    statusAuthText: string;
    authStatus: 'success' | 'pending' | 'failed';

};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const alert = useAlert();
    const [user, setUser] = useState<User | null>(null);
    const [isAuthPending, setAuthPending] = useState(false)
    const router = useRouter();
    const [statusAuthText, setStatusAuthText] = useState('')
    const [authStatus, setAuthStatus] = useState<'success' | 'pending' | 'failed'>('pending')


    useEffect(() => {
        const fetchUser = async () => {
            try {
                if (location.pathname === '/signup') return;

                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_BACKEND_API_URI}/v1/auth/me`,
                    {
                        withCredentials: true
                    }
                );
                // Optional: handle unexpected empty user data
                if (!response.data) {
                    //console.log(response.data)
                    console.warn("No user data found in response");
                    return;
                }

                // ✅ Successfully got user data
                setUser(response.data); // or setUser(response.data.user) if needed
                setAuthStatus('success')
                console.log(response.data)
                //router.push('/');
            } catch (error: any) {
                if (axios.isAxiosError(error)) {
                    if (error.response) {
                        if (error.response.status === 401) {
                            console.warn("Unauthorized: Session expired or not logged in.");
                            logout(); // optional: clear session state
                        } else {
                            console.error("API error:", error.response.status, error.response.data);
                        }
                    } else if (error.request) {
                        console.error("No response received from server:", error.request);
                    } else {
                        console.error("Axios config error:", error.message);
                    }
                } else {
                    console.error("Unexpected error:", error.message || error);
                }
            }
        };

        fetchUser();
    }, []);


    const login = async () => {
        try {


            setAuthPending(true);
            setStatusAuthText('Check your wallet to sign in...');



            setStatusAuthText('Authenticating...');

            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_BACKEND_API_URI}/v1/auth/login`,

                {
                    withCredentials: true,
                }
            );

            if (!response || !response.data) {
                throw new Error("Empty response from server");
            }

            setUser(response.data); // Adjust to response.data.user if needed
            setStatusAuthText('Login successful! Redirecting...');
            alert.success('Login successful')

            // Wait 3 seconds before redirecting
            setTimeout(() => {
                router.push('/');
                setStatusAuthText('');
            }, 500);
        } catch (error: any) {
            // console.error("Login error:", error);
            alert.error('something went wrong')

            // Handle axios-specific errors
            if (axios.isAxiosError(error)) {
                if (error.response) {
                    setStatusAuthText(`Login failed: ${error.response.data?.error || 'Server error'}`);
                } else if (error.request) {
                    setStatusAuthText('No response from server. Please check your internet.');
                } else {
                    setStatusAuthText(`Request error: ${error.message}`);
                }
            } else {
                setStatusAuthText(`Unexpected error: ${error.message || 'Something went wrong'}`);
            }

            logout();
        } finally {
            setAuthPending(false);
        }
    };


    const signup = async (formData: Partial<User> & { otp: string }) => {
        try {
            setAuthPending(true);
            setStatusAuthText('Authenticating...');

            // Build payload based on role
            let payload: any = {
                email: formData.email,
                phone: formData.phone,
                address: formData.address,
                role: formData.role,
                otp: formData.otp
            };
            if (formData.role === 'patent-owner') {
                payload.name = formData.name;
            } else if (formData.role === 'verifier') {
                payload.orgName = formData.orgName;
            } else if (formData.role === 'licensee') {
                payload.orgName = formData.orgName;
                if (formData.idType === 'pan') {

                } else if (formData.idType === 'cin') {
                    payload.cin = formData.cin;
                }
            }

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_API_URI}/v1/auth/signup`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify(payload),
                }
            );

            if (response.status === 409) {
                setStatusAuthText('Account already exists. Redirecting to login...');
                alert.success('Account already exists!');
                setTimeout(() => {
                    location.href = '/';
                    setStatusAuthText('');
                }, 3000);
                return;
            }

            if (response.ok) {
                const data = await response.json();
                setStatusAuthText('Signup successful! Redirecting...');
                alert.success('Signup successful');
                console.log("Signup successful:", data);
                setTimeout(() => {
                    location.href = '/dashboard';
                    setStatusAuthText('');
                }, 3000);
            } else {
                let errorMessage = 'Something went wrong';
                try {
                    const errorData = await response.json();
                    errorMessage = errorData?.error || errorMessage;
                } catch (parseError) {
                    console.error('Failed to parse error response');
                }
                setStatusAuthText(errorMessage);
                alert.error(errorMessage);
                console.warn("Signup failed:", errorMessage);
            }
        } catch (error: any) {
            const errMessage = error?.message || 'Unexpected error occurred';
            console.error("Signup error:", errMessage);
            setStatusAuthText(errMessage);
            alert.error(errMessage);
        } finally {
            setAuthPending(false);
        }
    };




    const logout = async () => {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URI}/v1/auth/logout`, {
            method: "POST",
            credentials: "include", // VERY IMPORTANT: enables sending/receiving cookies
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ user }),
        });
        console.log('Logout response:', res);


        if (res?.ok) {
            alert.success("Logout successful");
            location.href = '/';
            setUser(null)
        } else {
            alert.warn("Logout failed");
        }
    };

    return (
        <AuthContext.Provider value={{ user, logout, isAuthPending, signup, login, statusAuthText, authStatus, }}>
            {children}
        </AuthContext.Provider>
    );
};

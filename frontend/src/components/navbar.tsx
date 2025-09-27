"use client";

import { useEffect, useState } from "react";
import "./navbar.css";
import { ChevronDown, LogOut, Settings, User, Wallet } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { usePathname, useRouter } from "next/navigation";

export default function NavBar() {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const { logout } = useAuth();
    const pathname = usePathname()
    const router = useRouter()

    useEffect(() => {
        const handleClickOutside = (event: any) => {
            if (!event.target.closest('.account-dropdown')) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);


    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    const handleMenuClick = (action: any) => {
        console.log(`${action} clicked`);
        setIsDropdownOpen(false);
        // Add your navigation logic here
    };
    if (pathname === '/login' || pathname === '/signup' || pathname === '/') return null;

    return (
        <section id='navbar' className="navbar-body">
            <div className="logo-cont">MIntellect</div>

            <div className="account-dropdown">
                <button
                    className="account-btn"
                    onClick={toggleDropdown}
                    aria-expanded={isDropdownOpen}
                >
                    <User size={24} />
                </button>

                {isDropdownOpen && (
                    <div className="dropdown-menu">
                        <button
                            className="dropdown-item"
                            onClick={() => router.push('/dashboard')}
                        >
                            <User size={16} />
                            dashboard
                        </button>
                        <button
                            className="dropdown-item"
                            onClick={() => handleMenuClick('profile')}
                        >
                            <User size={16} />
                            Profile
                        </button>

                        <button
                            className="dropdown-item"
                            onClick={() => handleMenuClick('settings')}
                        >
                            <Settings size={16} />
                            Settings
                        </button>

                        <div className="dropdown-divider"></div>

                        <button
                            className="dropdown-item logout"
                            onClick={() => logout()}
                        >
                            <LogOut size={16} />
                            Logout
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
}

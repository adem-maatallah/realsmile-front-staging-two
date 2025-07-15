import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function useAuth(shouldRedirect) {
    const {user} = useAuth()
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        if (error === "RefreshAccessTokenError") {
            signOut({ callbackUrl: '/signin', redirect: shouldRedirect });
        }

        if (session === null) {
            if (router.route !== '/signin') {
                router.replace('/signin');
            }
            setIsAuthenticated(false);
        } else if (session !== undefined) {
            if (router.route === '/signin') {
                router.replace('/');
            }
            setIsAuthenticated(true);
        }
    }, [session]);

    return isAuthenticated;
}
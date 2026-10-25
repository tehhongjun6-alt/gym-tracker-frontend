import {
    Navigate,
    Outlet,
} from "react-router-dom";

export default function ProtectedRoute({ token }) {
    // 没有登录 token，就回到登录页面
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // 已登录就显示里面的页面
    return <Outlet />;
}

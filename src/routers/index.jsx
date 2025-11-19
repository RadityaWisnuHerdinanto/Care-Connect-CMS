import { createBrowserRouter } from "react-router-dom";
import Home from "../screens/Home";
import Login from "../screens/Login";
import CreateActivity from "../screens/CreateActivity";
import ActivityDetail from "../screens/ActivityDetail";
import EditActivity from "../screens/EditActivity";

const router = createBrowserRouter([
    {
        path: "/",
        element: <Home />,
    },
    {
        path: "/login",
        element: <Login />,
    },
    {
        path: "/create-activity",
        element: <CreateActivity />,
    },
    {
        path: "/activity/:id",
        element: <ActivityDetail />,
    },
    {
        path: "/edit-activity/:id",
        element: <EditActivity />,
    },
]);

export default router;

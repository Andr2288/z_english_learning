import { GoTrashcan } from "react-icons/go";
import Button from "./common/Button";
import { removeUser } from "../store";
import { useThunk } from "../hooks/use-thunk";

function UsersListItem({ user }) {
    const [doRemoveUser, isLoading, error] = useThunk(removeUser);

    const handleClick = () => {
        doRemoveUser(user);
    };

    const header = (
        <>
            <Button className="mr-3" loading={isLoading} onClick={handleClick}>
                <GoTrashcan />
            </Button>
            {error && <div>Error deleting user.</div>}
            {user.name}
        </>
    );

    return (
        <>
            <div className="bg-amber-300"> {user.name}</div>
        </>
    );
}

export default UsersListItem;

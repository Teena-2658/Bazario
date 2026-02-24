const UserCard = ({ user }) => {
  return (
    <div className="bg-white shadow p-4 rounded">
      <h3 className="font-semibold">{user.name}</h3>
      <p className="text-sm text-gray-600">{user.email}</p>
      <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
        {user.role}
      </span>
    </div>
  );
};

export default UserCard;
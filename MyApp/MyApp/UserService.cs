namespace MyApp
{
    public class UserService
    {
        private readonly IUserRepo _repo;

        public UserService(IUserRepo repo)
        {
            _repo = repo;
        }

        public bool HasUsers()
        {
            return _repo.GetUserCount() > 0;
        }
    }
}
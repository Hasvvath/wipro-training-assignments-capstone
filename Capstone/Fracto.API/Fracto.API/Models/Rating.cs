namespace Fracto.API.Models
{
    public class Rating
    {
        public int RatingId { get; set; }

        public int DoctorId { get; set; }

        public int UserId { get; set; }

        public int RatingValue { get; set; }
    }
}
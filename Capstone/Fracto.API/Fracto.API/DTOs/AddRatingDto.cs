namespace Fracto.API.DTOs
{
    public class AddRatingDto
    {
        public int UserId { get; set; }
        public int DoctorId { get; set; }
        public int AppointmentId { get; set; }
        public int Rating { get; set; }
    }

}

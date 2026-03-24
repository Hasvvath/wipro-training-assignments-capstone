namespace Fracto.API.DTOs
{
    public class BookAppointmentDto
    {
        public int UserId { get; set; }
        public int DoctorId { get; set; }
        public DateTime AppointmentDate { get; set; }
        public string TimeSlot { get; set; } = string.Empty;

        public string ConsultationType { get; set; } = "InPerson"; 
        public string? MeetingLink { get; set; }
    }
}

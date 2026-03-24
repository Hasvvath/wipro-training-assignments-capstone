namespace Fracto.API.Models
{
    public class Appointment
    {
        public int AppointmentId { get; set; }
        public int UserId { get; set; }
        public int DoctorId { get; set; }
        public DateTime AppointmentDate { get; set; }
        public string TimeSlot { get; set; } = string.Empty;
        public string Status { get; set; } = "Booked";

        public string ConsultationType { get; set; } = "InPerson"; 
        public string? MeetingLink { get; set; }
        public string? CancellationReason { get; set; }
    }
}

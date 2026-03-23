namespace Fracto.API.DTOs
{
    public class CreateDoctorLeaveDto
    {
        public int DoctorId { get; set; }
        public DateTime LeaveDate { get; set; }
        public bool IsFullDay { get; set; }
        public string? TimeSlot { get; set; }
        public string? Reason { get; set; }
    }
}

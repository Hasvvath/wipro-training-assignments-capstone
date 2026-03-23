namespace Fracto.API.Models
{
    public class DoctorLeave
    {
        public int DoctorLeaveId { get; set; }
        public int DoctorId { get; set; }
        public DateTime LeaveDate { get; set; }   
        public bool IsFullDay { get; set; }
        public string? TimeSlot { get; set; }     
        public string? Reason { get; set; }
    }
}

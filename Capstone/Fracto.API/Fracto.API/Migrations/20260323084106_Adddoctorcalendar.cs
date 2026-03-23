using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Fracto.API.Migrations
{
    /// <inheritdoc />
    public partial class Adddoctorcalendar : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CancellationReason",
                table: "Appointments",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "DoctorLeaves",
                columns: table => new
                {
                    DoctorLeaveId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    DoctorId = table.Column<int>(type: "int", nullable: false),
                    LeaveDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IsFullDay = table.Column<bool>(type: "bit", nullable: false),
                    TimeSlot = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    Reason = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DoctorLeaves", x => x.DoctorLeaveId);
                });

            migrationBuilder.CreateIndex(
                name: "IX_DoctorLeaves_DoctorId_LeaveDate_IsFullDay_TimeSlot",
                table: "DoctorLeaves",
                columns: new[] { "DoctorId", "LeaveDate", "IsFullDay", "TimeSlot" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DoctorLeaves");

            migrationBuilder.DropColumn(
                name: "CancellationReason",
                table: "Appointments");
        }
    }
}

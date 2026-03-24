using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Fracto.API.Migrations
{
    /// <inheritdoc />
    public partial class Addconsultation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ConsultationType",
                table: "Appointments",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "MeetingLink",
                table: "Appointments",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ConsultationType",
                table: "Appointments");

            migrationBuilder.DropColumn(
                name: "MeetingLink",
                table: "Appointments");
        }
    }
}

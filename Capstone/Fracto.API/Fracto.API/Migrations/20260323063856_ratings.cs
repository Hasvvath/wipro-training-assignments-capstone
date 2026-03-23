using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Fracto.API.Migrations
{
    /// <inheritdoc />
    public partial class ratings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "RatingValue",
                table: "Ratings",
                newName: "Score");

            migrationBuilder.AddColumn<int>(
                name: "AppointmentId",
                table: "Ratings",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AppointmentId",
                table: "Ratings");

            migrationBuilder.RenameColumn(
                name: "Score",
                table: "Ratings",
                newName: "RatingValue");
        }
    }
}

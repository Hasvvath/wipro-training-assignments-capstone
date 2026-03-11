using DAL;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Models1;

namespace Pharmacy.Controllers.API
{
    [Authorize(Roles = "Admin")]
    [Route("api/[controller]")]
    [ApiController]
    public class PharmaciesController : ControllerBase
    {
        private readonly PharmacyContext _context;

        public PharmaciesController(PharmacyContext context)
        {
            _context = context;
        }

        // GET: api/Pharmacies
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Models1.Pharmacy>>> Getpharmacies()
        {
            return await _context.pharmacies.ToListAsync();
        }

        // GET: api/Pharmacies/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Models1.Pharmacy>> GetPharmacy(int id)
        {
            var pharmacy = await _context.pharmacies.FindAsync(id);
            if (pharmacy == null) return NotFound();
            return pharmacy;
        }

        // POST: api/Pharmacies
        [HttpPost]
        public async Task<ActionResult<Models1.Pharmacy>> PostPharmacy(Models1.Pharmacy pharmacy)
        {
            _context.pharmacies.Add(pharmacy);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetPharmacy), new { id = pharmacy.Id }, pharmacy);
        }

        // PUT: api/Pharmacies/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutPharmacy(int id, Models1.Pharmacy pharmacy)
        {
            if (id != pharmacy.Id) return BadRequest();

            _context.Entry(pharmacy).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/Pharmacies/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePharmacy(int id)
        {
            var pharmacy = await _context.pharmacies.FindAsync(id);
            if (pharmacy == null) return NotFound();

            _context.pharmacies.Remove(pharmacy);
            await _context.SaveChangesAsync();

            return NoContent();
        }
        //[Authorize(Roles = "Admin")]
        //[HttpPost]
        //public async Task<IActionResult> PostPharmacy(Models1.Pharmacy pharmacy)
        //{
        ///    _context.pharmacies.Add(pharmacy);
        //    await _context.SaveChangesAsync();
        //    return Ok(pharmacy);
        //}

    }
}

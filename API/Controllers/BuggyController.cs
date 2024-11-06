using API.Controllers;
using API.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API;

public class BuggyController(DataContext context) : BaseApiController
 {
    [Authorize]
    [HttpGet("auth")]
    public ActionResult<string> GetAuth()
    {
        return "Secret text";
    }

    [HttpGet("not-found")]
    public ActionResult<string> GetNotFound()
    {
        return NotFound();
    }
    
    [HttpGet("server-error")]
    public ActionResult<string> GetServerError()
    {
        var thing = context.Users.Find(-1) ?? throw new Exception("bad thing happened");

            var thingToReturn = thing.ToString();

            if(thingToReturn == null) return NotFound();

            return thingToReturn;

        // try{
        //     var thing = context.Users.Find(-1) ?? throw new Exception("bad thing happened");

        //     var thingToReturn = thing.ToString();

        //     return thingToReturn;
        // }
        // catch(Exception ex)
        // {
        //     return StatusCode(500, "Computer says no!");
        // }
        
    }

    [HttpGet("bad-request")]
    public ActionResult<string> GetBadRequest()
    {
        return BadRequest("This was not a good request");
    }

 }
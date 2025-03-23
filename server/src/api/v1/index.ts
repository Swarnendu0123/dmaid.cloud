import { Router } from "express";
import { EventModel } from "../../db/schema";
import { generateDiagram } from "../../controllers/aiDiagramGenerator";
import { generateTitle } from "../../controllers/aiTitleGenerator";

const router = Router();

router.get("/", (req, res) => {
  res.send({
    message: "Welcome to dmaid.cloud server!",
    ref_docs: [
      "https://expressjs.com/en/5x/api.html",
      "https://mongoosejs.com/docs/guide.html",
    ],
    version: "V1",
    routes: {
      "info routes": {
        "GET '/'": "should redirect to '/api/v1'",
        "GET '/api/v1'": "should display all the API Route information",
      },

      "diagram Routes": {
        "GET '/api/v1/diagram/:uuid'": "to get a specific diagram",
        "POST '/api/v1/diagram/create'":
          "to save a specific diagram for the first time",
        "PUT '/api/v1/diagram/edit/:uuid'": "to edit a specific diagram",
      },

      "access control routes": {
        "PUT '/api/v1/control/view/:email'":
          "to give view access of a specific file (check owner)",
        "PUT '/api/v1/control/edit/:email'":
          "to give the edit access of a specific diagram (check owner)",
        "PUT '/api/v1/control/transfer/:email'":
          "to transfer the ownership to a specific user",
      },

      "AI Routes": {
        "POST 'api/v1/diagram/generate'": "to generate a diagram using GEN AI",
      },
    },
  });
});

// route to get all events
router.post("/diagram/generate", async (req, res) => {
  try {
    const prompt = req.body.prompt;

    console.log(prompt);

    const generated_diagram = await generateDiagram(prompt);
    const generated_title = await generateTitle(prompt);

    console.log(generated_diagram);
    console.log(generated_title);
    

    res.send({
      messege: "Diagram generated",
      diagram: generated_diagram,
      title: generated_title,
      success: true,
    });
  } catch (e) {
    res.send({ message: "Error in generating the response!", success: false });
  }
});

export default router;

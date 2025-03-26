import { Router } from "express";
import { generateTextToDiagramWithGorq } from "../../controllers/gen_ai/text_to_diagram";
import { generateTextToTitleWithGroq } from "../../controllers/gen_ai/text_to_title";
import { generateDiagramToTitleWithGorq } from "../../controllers/gen_ai/diagram_to_title";
import { diagramEnhancer } from "../../controllers/gen_ai/diagram_enhancer";
import { Model, model } from "mongoose";

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

const default_model = "gemma2-9b-it";

// route to generate diagrams based on prompt
router.post("/diagram/generate", async (req, res) => {
  try {
    const prompt = req.body.prompt;
    const model = req.body.model;

    console.log({prompt: prompt, model: model});

    const generated_diagram = await generateTextToDiagramWithGorq(
      prompt,
      model || default_model
    );

    const generated_title = await generateTextToTitleWithGroq(
      prompt,
      model || default_model
    );

    res.send({
      messege: "Diagram generated",
      diagram: generated_diagram,
      title: generated_title,
      success: true,
    });
  } catch (e) {
    res.send({
      message: "Error in generating the response!",
      success: false,
      error: e,
    });
  }
});

// route to enhance diagrams based on prompts
router.post("/diagram/enhance", async (req, res) => {
  try {
    const diagram = req.body.diagram;
    const prompt = req.body.prompt;
    const model = req.body.model;

    console.log(diagram);
    console.log(prompt);

    const generated_diagram = await diagramEnhancer(
      prompt,
      diagram,
      model || default_model
    );

    console.log(generated_diagram);

    res.send({
      messege: "Diagram enhanced",
      diagram: generated_diagram,
      success: true,
    });
  } catch (e) {
    res.send({ message: "Error in enhancing the diagram!", success: false });
  }
});

// route to generate titles based on diagrams
router.post("/title/generate", async (req, res) => {
  try {
    const diagram = req.body.diagram;
    const model = req.body.model;

    console.log(diagram);

    const generated_title = await generateDiagramToTitleWithGorq(
      diagram,
      model || default_model
    );

    console.log(generated_title);

    res.send({
      messege: "Title generated",
      title: generated_title,
      success: true,
    });
  } catch (e) {
    res.send({ message: "Error in generating the title!", success: false });
  }
});

export default router;

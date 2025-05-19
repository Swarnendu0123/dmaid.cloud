import { Router, Request, Response } from "express";
import { generateTextToDiagramWithGorq } from "../../controllers/gen_ai/text_to_diagram";
import { generateTextToTitleWithGroq } from "../../controllers/gen_ai/text_to_title";
import { generateDiagramToTitleWithGorq } from "../../controllers/gen_ai/diagram_to_title";
import { diagramEnhancer } from "../../controllers/gen_ai/diagram_enhancer";
import { authenticateUser, AuthRequest } from "../../middleware/middleware";

// Importing Schemas
import { User } from "../../db/schema/index";
import { Diagram } from "../../db/schema/index";

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

// AI Routes
// route to generate diagrams based on prompt
router.post("/diagram/generate", async (req, res) => {
  try {
    const prompt = req.body.prompt;
    const model = req.body.model;

    console.log({ prompt: prompt, model: model });

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

// User routes
// function to upsert user
router.post("/users/upsert", async (req, res) => {
  try {
    const { name, email, currentToken } = req.body;
    console.log("upsert user", currentToken);

    if (!email || !currentToken) {
      res.status(404).json({ error: "email or current token is not provided" });
    }

    console.log(email, currentToken);
    const findUser = await User.findOne({ email }).exec();
    console.log(findUser);
    let user;
    if (findUser) {
      user = await User.findByIdAndUpdate(
        findUser._id, // filter
        { name, email, currentToken }, // update
        { new: true, runValidators: true } // options: return the updated doc
      ).exec();
    } else {
      user = new User({ name, email, currentToken });
      await user.save();
    }

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.cookie("authToken", currentToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    res.status(201).json(user);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// function to get user by id
router.get("/users/:id", authenticateUser, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).exec();
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// function to update user details
router.put("/users/:id", authenticateUser, async (req, res) => {
  try {
    const updateData = { ...req.body, updatedAt: new Date() };
    const user = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    }).exec();

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json(user);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Diagram route configuration
export interface IDiagram extends Document {
  diagramName: string;
  code: string;
  ownerEmail?: string;
  views?: string[];
  edits?: string[];
  mode?: Mode;
}

enum Mode {
  "private",
  "publicView",
  "publicEdit",
}

// Create a new diagram
router.post("/diagrams/", authenticateUser, async (req: AuthRequest, res: Response) => {
  try {
    const payload = req.body as Partial<IDiagram>;
    
    const diagram = new Diagram({ ...payload, ownerEmail: req.email });
    await diagram.save();
    res.status(201).json(diagram);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Get all diagrams (optionally filter by owner)
router.get("/diagrams/", authenticateUser, async (req: AuthRequest, res: Response) => {
  try {
    const filter = req.query.ownerEmail
      ? { ownerEmail: req.query.ownerEmail }
      : { ownerEmail: req.email };
    const diagrams = await Diagram.find(filter).exec();
    res.json(diagrams);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get a single diagram by ID
router.get("/diagrams/:id/:mode",
  authenticateUser,
  async (req: AuthRequest, res: Response) => {
    try {
      const mode = req.params.mode;
      const diagram = await Diagram.findById(req.params.id).exec();
      if (!diagram) {
        res.status(404).json({ error: "Not found" });
        return;
      }
      if (diagram.mode !== mode) {
        res.status(404).json({ error: "Not found" });
        return;
      }

      let access, allowed;
      console.log(req.email, diagram.edits, diagram.view);
      if (diagram.mode === "private") {
        if (diagram.ownerEmail === req.email) {
          access = "owner";
          allowed = true;
        } else if (diagram.views.includes(req.email)) {
          access = "view";
          allowed = true;
        } else if (diagram.edits.includes(req.email)) {
          access = "edit";
          allowed = true;
        } else {
          access = "no-access";
          allowed = false;
        }
      } else if (diagram.mode === "publicView") {
        access = "viewer";
        allowed = true;
      } else if (diagram.mode === "publicEdit") {
        access = "editor";
        allowed = true;
      }

      if (!allowed) {
        res.status(400).json({
          msg: "sorry you are prohibited to access this document",
        });
        return;
      }

      res.json({
        diagram,
        access,
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
);

// Update an existing diagram
router.put("/diagrams/:id",
  authenticateUser,
  async (req: AuthRequest, res: Response) => {
    try {
      const update = req.body as Partial<IDiagram>;
      const diagram = await Diagram.findByIdAndUpdate(req.params.id, update, {
        new: true,
        runValidators: true,
      }).exec();
      if (!diagram) {
        res.status(404).json({ error: "Not found" });
        return;
      }
      res.json(diagram);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
);

// Delete specific diagram by ID
router.delete("/diagrams/:id",
  authenticateUser,
  async (req: AuthRequest, res: Response) => {
    try {
      const result = await Diagram.findByIdAndDelete(req.params.id).exec();
      if (!result) {
        res.status(404).json({ error: "Not found" });
        return;
      }
      res.json({ message: "Deleted" });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
);

// Append a “view” Diagram
router.post("/diagrams/:id/views",
  authenticateUser,
  async (req: AuthRequest, res: Response) => {
    try {
      const { viewerEmail } = req.body;
      const diagram = await Diagram.findByIdAndUpdate(
        req.params.id,
        { $addToSet: { edits: viewerEmail } },
        { new: true }
      ).exec();
      if (!diagram) {
        res.status(404).json({ error: "Not found" });
        return;
      }
      res.json(diagram);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
);

// Append an “edit” Diagram
router.post("/diagrams/:id/edits",
  authenticateUser,
  async (req: AuthRequest, res: Response) => {
    try {
      const { editorEmail } = req.body;
      const diagram = await Diagram.findByIdAndUpdate(
        req.params.id,
        { $addToSet: { edits: editorEmail } },
        { new: true }
      ).exec();
      if (!diagram) {
        res.status(404).json({ error: "Not found" });
        return;
      }
      res.json(diagram);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
);

export default router;

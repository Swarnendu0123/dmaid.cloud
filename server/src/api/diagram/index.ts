import { Router, Request, Response } from 'express';
import { Diagram  } from '../../db/schema/index';
import { authenticateUser, AuthRequest } from '../../middleware/middleware'; // optional

const router = Router();

export interface IDiagram extends Document {
  diagramName: string;
  code: string;
  ownerEmail?: string;
  views?: string[];
  edits?: string[];
  mode?:  Mode
}

enum Mode {
    "private",
    "publicView",
    "publicEdit"
}

// Create a new diagram
router.post('/', authenticateUser, async (req: AuthRequest, res: Response) => {
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
router.get('/', authenticateUser, async (req: AuthRequest, res: Response) => {
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
router.get('/:id/:mode', authenticateUser, async (req: AuthRequest, res: Response) => {
  try {
    const mode = req.params.mode
    const diagram = await Diagram.findById(req.params.id).exec();
    if (!diagram) {
    res.status(404).json({ error: 'Not found' });
    return
    }
    if (diagram.mode!==mode){
    res.status(404).json({ error: 'Not found' });
    return   
    }

    let access,allowed;
    console.log(req.email,diagram.edits,diagram.view)
    if(diagram.mode==='private'){
        if(diagram.ownerEmail===req.email){
            access="owner"
            allowed=true
        }else if(diagram.views.includes(req.email)){
            access="view"
            allowed=true
        }else if(diagram.edits.includes(req.email)){
            access="edit"
            allowed=true
        }else{
            access="no-access"
            allowed=false
        }
    }else if(diagram.mode==='publicView'){
       access="viewer"
       allowed=true
    }else if(diagram.mode==='publicEdit'){
       access="editor"
       allowed=true
    }
    
    if(!allowed){
        res.status(400).json({
         msg:"sorry you are prohibited to access this document"
    });
    return
    }

    res.json({
      diagram,
      access,
    });

  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Update an existing diagram
router.put('/:id', authenticateUser, async (req: AuthRequest, res: Response) => {
  try {
    const update = req.body as Partial<IDiagram>;
    const diagram = await Diagram.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true, runValidators: true }
    ).exec();
    if (!diagram) {
    res.status(404).json({ error: 'Not found' });
    return
    }     res.json(diagram);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a diagram
router.delete('/:id', authenticateUser, async (req: AuthRequest, res: Response) => {
  try {
    const result = await Diagram.findByIdAndDelete(req.params.id).exec();
    if (!result) {
    res.status(404).json({ error: 'Not found' });
    return
    }     res.json({ message: 'Deleted' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Append a “view” entry
router.post('/:id/views', authenticateUser, async (req: AuthRequest, res: Response) => {
  try {
    const { viewerEmail } = req.body;
    const diagram = await Diagram.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { edits: viewerEmail } },
      { new: true }
    ).exec();
    if (!diagram) {
    res.status(404).json({ error: 'Not found' });
    return
    }     res.json(diagram);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Append an “edit” entry
router.post('/:id/edits', authenticateUser, async (req: AuthRequest, res: Response) => {
  try {
    const { editorEmail } = req.body;
    const diagram = await Diagram.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { edits: editorEmail } },
      { new: true }
    ).exec();
    if (!diagram) {
    res.status(404).json({ error: 'Not found' });
    return
    }     res.json(diagram);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;

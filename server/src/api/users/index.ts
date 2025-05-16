import  {User} from '../../db/schema/index';
import { Router } from 'express';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const { name, email, password, currentToken } = req.body;

    const user = new User({ name, email, password, currentToken });
    await user.save();

    res.status(201).json(user);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});




router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).exec();
    if (!user) {    
    res.status(404).json({ error: 'User not found' });
    return;
    }
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});


router.put('/:id', async (req, res) => {
  try {
    const updateData = { ...req.body, updatedAt: new Date() };
    const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true }).exec();

    if (!user){
     res.status(404).json({ error: 'User not found' });    
     return;
    }

    res.json(user);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;

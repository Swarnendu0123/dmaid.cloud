import { authenticateUser } from '../../middleware/middleware';
import  {User} from '../../db/schema/index';
import { Router } from 'express';

const router = Router();


router.post('/upsert', async (req, res) => {
  try {
    const { name, email,  currentToken } = req.body;
   
    if(!email || !currentToken ){
       res.status(404).json({ error: 'email or current token is not provided' });
    }

    console.log(email,currentToken)
    const findUser= await User.findOne({ email }).exec();
    console.log(findUser)
    let user;
    if(findUser){
    user = await User.findByIdAndUpdate(
      findUser._id,                       // filter
      { name, email, currentToken },      // update
      { new: true, runValidators: true }  // options: return the updated doc
    ).exec();
    }else{
    user = new User({ name, email, currentToken });
    await user.save();
    }

    if (!user) {
       res.status(404).json({ error: 'User not found' });
       return
    }

    res.cookie('authToken', currentToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    });

    res.status(201).json(user);

  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});




router.get('/:id',authenticateUser, async (req, res) => {
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


router.put('/:id', authenticateUser,async (req, res) => {
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

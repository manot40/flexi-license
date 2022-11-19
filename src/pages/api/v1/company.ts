import db from 'libs/db';
import requireAuth from 'libs/requireAuth';

export default requireAuth(async (req, res) => {
  switch (req.method) {
    case 'GET':
      return res.status(200).json(await db.company.findMany());
  }
});

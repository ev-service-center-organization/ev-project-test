import app from './src/app.js';
import sequelize from './src/config/db.js';
import ServiceCenter from './src/models/serviceCenter.js';

const PORT = process.env.PORT || 5002;

const seedDefaultServiceCenter = async () => {
  await ServiceCenter.findOrCreate({
    where: { id: 1 },
    defaults: {
      name: 'TEST',
      address: 'HCM',
      phone: '123'
    }
  });
};

const startServer = async () => {
  try {
    await sequelize.authenticate();
    try {
      await sequelize.sync({ alter: true });
    } catch (syncError) {
      console.error('Unable to alter booking schema, forcing sync:', syncError.message);
      await sequelize.sync({ force: true });
    }
    await seedDefaultServiceCenter();
    app.listen(PORT, () => console.log(`🚀 Booking Service running on port ${PORT}`));
  } catch (error) {
    console.error('Unable to start Booking Service:', error);
    process.exit(1);
  }
};

startServer();

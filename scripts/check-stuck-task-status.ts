import prisma from '../src/lib/prisma';

async function checkTask() {
  const task = await prisma.autoModelingTask.findUnique({
    where: { id: 'cmlhkso8c0001cf20jfprnz4o' },
    include: {
      discussion: true,
      codeGeneration: true,
      validations: true,
      paper: true,
    },
  });
  console.log(JSON.stringify(task, null, 2));
}

checkTask().then(() => process.exit(0)).catch((err) => {
  console.error(err);
  process.exit(1);
});

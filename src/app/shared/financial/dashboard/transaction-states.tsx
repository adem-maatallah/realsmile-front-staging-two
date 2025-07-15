exports.getCasSelonLesPacks = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const dateFilter = {
      gte: startDate ? new Date(startDate) : new Date(new Date().getFullYear(), 0, 1),
      lt: endDate ? new Date(endDate) : new Date(new Date().getFullYear(), 11, 31),
    };

    const casPacks = await prisma.cases.groupBy({
      by: ['pack_id'],
      _count: {
        _all: true,
      },
      where: {
        created_at: dateFilter,
      },
    });

    res.status(200).json(casPacks.map((item) => ({
      label: `Pack ${item.pack_id}`,
      count: item._count._all,
    })));
  } catch (error) {
    console.error('Error fetching cas selon les packs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

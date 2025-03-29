const getProviders = async (req, res) => {
  try {
    const providers = await req.openDentalService.getProviders();

    res.json({
      success: true,
      count: providers.length,
      data: providers,
    });
  } catch (error) {
    console.error("Error fetching providers:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch providers",
    });
  }
};

const getProviderById = async (req, res) => {
  try {
    const providerId = req.params.id;
    const provider = await req.openDentalService.getProvider(providerId);

    if (!provider) {
      return res.status(404).json({
        success: false,
        error: "Provider not found",
      });
    }

    res.json({
      success: true,
      data: provider,
    });
  } catch (error) {
    console.error("Error fetching provider by ID:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch provider",
    });
  }
};

module.exports = {
  getProviders,
  getProviderById,
};


// Fix only the relevant part using bannerUrls
const bannerSection = () => {
  if (election.bannerUrls && election.bannerUrls.length > 0) {
    return (
      <div className="relative w-full h-32 mb-4 overflow-hidden">
        <img 
          src={election.bannerUrls[0]} 
          alt={election.title} 
          className="w-full h-full object-cover rounded-t-md"
        />
      </div>
    );
  }
  return null;
};

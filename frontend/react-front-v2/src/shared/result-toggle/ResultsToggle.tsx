const ResultsToggle = () => {
  return (
    <div className="flex cursor-pointer rounded-full  border border-lightGray bg-white">
      <div className="cursor-pointer rounded-full bg-gradient-to-r from-redSalsa to-sunsetOrange px-2 py-1 font-medium text-white">
        Results Summary
      </div>
      <div className="px-2 py-1 text-gray">Full Statistics</div>
    </div>
  )
}

export default ResultsToggle

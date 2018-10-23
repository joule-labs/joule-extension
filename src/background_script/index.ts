// TODO: Keep an eye on transactions / channels in here?

const polling = () => {
  console.log("polling");
  setTimeout(polling, 1000 * 30);
};

polling();

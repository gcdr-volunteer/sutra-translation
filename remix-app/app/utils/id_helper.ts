export const getSutraId = (id: string) => {
  return id.split('-').slice(0, 3).join('-');
};

export const getRollId = (id: string) => {
  return id.split('-').slice(0, 4).join('-');
};

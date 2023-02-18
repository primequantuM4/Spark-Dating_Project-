function pleaseLogin(fetchResult) {
  if ((fetchResult.status = 401)) {
    alert("please login ");
    throw new Error("not logged in");
  }
}

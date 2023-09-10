// export const handlePostDelete = (postId: number) => {
//   fetch(`https://501881a3cd249a1b.mokky.dev/posts/${postId}`, {
//     method: "DELETE",
//   })
//     .then((response) => response.json())
//     .then((data) => console.log(data))
//     .catch((error) => {
//       console.log(error);
//       alert("Произошла ошибка при удалении поста :(");
//     });
// };
//https://41adf6f41ba9f813.mokky.dev
export const handlePostDelete = (postId: number) => {
  fetch(`https://41adf6f41ba9f813.mokky.dev/posts/${postId}`, {
    method: "DELETE",
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok.");
      }
      if (response.status === 204) {
        console.log("Post deleted successfully");
        return;
      }
      return response.json();
    })
    .then((data) => console.log(data))
    .catch((error) => {
      console.log(error);
      alert("Error deleting post. Please try again later.");
    });
};

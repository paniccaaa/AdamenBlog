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

export const handlePostDelete = (postId: number) => {
  fetch(`https://501881a3cd249a1b.mokky.dev/posts/${postId}`, {
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

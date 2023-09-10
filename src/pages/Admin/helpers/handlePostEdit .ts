export const handlePostEdit = (
  postId: number,
  value: string,
  title: string,
  image: string
) => {
  const postData = {
    text: value,
    title: title,
    image: image,
  };
  //https://41adf6f41ba9f813.mokky.dev
  fetch(`https://41adf6f41ba9f813.mokky.dev/posts/${postId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(postData),
  })
    .then((response) => response.json())
    .then((data) => console.log(data))
    .catch((error) => {
      console.log(error);
      alert("Произошла ошибка при редактировании поста :(");
    });
};

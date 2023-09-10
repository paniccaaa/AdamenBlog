export const handlePostPublish = (
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
  fetch("https://41adf6f41ba9f813.mokky.dev/posts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(postData),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
    })
    .catch((error) => {
      console.error(error);
    });
};

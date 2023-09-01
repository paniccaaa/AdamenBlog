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
  fetch("https://501881a3cd249a1b.mokky.dev/posts", {
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

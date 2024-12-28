const mongoose = require("mongoose");

mongoose
  .connect("mongobd://localhost/taskmanager")
  .then(() => console.log("connected to MongoBD..."))
  .catch((err) => console.error("Could not connect to mongoDB....", err));

const courseSchema = new mongoose.Schema({
  text: String,
  date: String,
  select: String,
  textarea: String,
});

const Course = mongoose.model("course", courseSchema);

async function createCourse() {
  const course = new Course({
    text: "hello",
    date: "20-10-2010",
    select: "low",
    textarea: "this is nice",
  });

  const result = await course.save();
  console.log(result);
}
createCourse();

async function getCourse() {
  const result = Course.find();
  console.log(result);
}
getCourse();

async function updateCourse(id) {
  const course = await Course.findById(id);
  if (!course) return;
  course.set({
    text: "hello",
  });
  const result = await course.save();
}
updateCourse("1");

async function deleteCourse(id) {
  //   const result = await Course.deleteOne({ _id: id });
  const result = await Course.findByIdAndRemove(id);
  console.log(result);
}
deleteCourse("1");

import { Component, OnInit } from "@angular/core";

import { QuizService } from "../services/quiz.service";
import { HelperService } from "../services/helper.service";
import { Option, Question, Quiz, QuizConfig } from "../models/index";

@Component({
  selector: "app-quiz",
  templateUrl: "./quiz.component.html",
  styleUrls: ["./quiz.component.css"],
  providers: [QuizService]
})
export class QuizComponent implements OnInit {
  quizes: any[];
  quiz: Quiz = new Quiz(null);
  mode = "quiz";
  quizName: string;
  totalScore: number;
  lastQuestion: boolean;
  selected: boolean = false;
 

  config: QuizConfig = {
    allowBack: true,
    allowReview: true,
    autoMove: false, // if true, it will move to next question automatically when answered.
    duration: 0, // indicates the time (in secs) in which quiz needs to be completed. 0 means unlimited.
    pageSize: 1,
    requiredAll: false, // indicates if you must answer all the questions before submitting.
    richText: false,
    shuffleQuestions: false,
    shuffleOptions: false,
    showClock: false,
    showPager: true,
    theme: "none"
  };

  pager = {
    index: 0,
    size: 1,
    count: 1
  };
  timer: any = null;
  startTime: Date;
  endTime: Date;
  ellapsedTime = "00:00";
  duration = "";

  constructor(private quizService: QuizService) {}

  ngOnInit() {
    this.quizes = this.quizService.getAll();
    this.quizName = this.quizes[0].id;
    this.loadQuiz(this.quizName);
  }

  loadQuiz(quizName: string) {
    this.quizService.get(quizName).subscribe(res => {
      this.quiz = new Quiz(res);
      this.pager.count = this.quiz.questions.length;
      this.startTime = new Date();
      this.timer = setInterval(() => {
        this.tick();
      }, 1000);
      this.duration = this.parseTime(this.config.duration);
    });
    this.mode = "quiz";
  }

  tick() {
    const now = new Date();
    const diff = (now.getTime() - this.startTime.getTime()) / 1000;
    if (this.config.duration != 0 && diff >= this.config.duration) {
      this.onSubmit();
    }
    this.ellapsedTime = this.parseTime(diff);
  }

  parseTime(totalSeconds: number) {
    let mins: string | number = Math.floor(totalSeconds / 60);
    let secs: string | number = Math.round(totalSeconds % 60);
    mins = (mins < 10 ? "0" : "") + mins;
    secs = (secs < 10 ? "0" : "") + secs;
    return `${mins}:${secs}`;
  }

  get filteredQuestions() {
    return this.quiz.questions
      ? this.quiz.questions.slice(
          this.pager.index,
          this.pager.index + this.pager.size
        )
      : [];
  }

  onSelect(question: Question, option: Option) {
    if (question.questionTypeId === 1) {
      question.options.forEach(x => {
        if (x.id !== option.id) x.selected = false;
        if (x.id == option.id) question.score = x.optionScore;
      });
    }

    if (this.config.autoMove) {
      this.pager.index++;
      this.goTo(this.pager.index);
    }

    this.enableSelected(question);
  }

  goTo(index: number) {
    if (index >= 0 && index < this.pager.count) {
      this.pager.index = index;
      this.mode = "quiz";
    }

    if (index == this.pager.count) {
      this.lastQuestion = true;
      this.mode = "lastPage";
    }

    this.disableSelected();
  }

  isAnswered(question: Question) {
    return question.options.find(x => x.selected) ? "Answered" : "Not Answered";
  }

  enableSelected(question: Question) {
    if(question.options.find(x => x.selected)){
      this.selected = true;
    }else{
      this.selected = false;
    }
    // console.log("toggle selected called");
    // this.selected = true;
  }

  disableSelected() {
    // console.log("toggle selected called");
    this.selected = false;
  }

  isCorrect(question: Question) {
    return question.options.every(x => x.selected === x.isAnswer)
      ? "correct"
      : "wrong";
  }

  onSubmit() {
    let answers = [];
    this.quiz.questions.forEach(x =>
      answers.push({
        quizId: this.quiz.id,
        questionId: x.id,
        answered: x.answered
      })
    );

    this.totalScore = this.calculateScore();

    this.mode = "result";

    

    // Post your data to the server here. answers contains the questionId and the users' answer.
    // console.log(this.quiz.questions);
  }

  calculateScore() {
    let finalScores: number[] = [];
    let sumup: number = 0;
    this.quiz.questions.forEach(x => finalScores.push(x.score));

    //console.log(finalScores);

    for (var i = 0; i < finalScores.length; i++) {
      sumup += finalScores[i];
    }

    return sumup;
  }

  printResult(){
    window.print();
  }

}

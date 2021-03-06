import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { FormGroup, FormControl, FormArray, Validators } from '@angular/forms';
import { RecipeService } from '../recipe.service';
import { Recipe } from '../recipe.model';

@Component({
  selector: 'app-recipe-edit',
  templateUrl: './recipe-edit.component.html',
  styleUrls: ['./recipe-edit.component.css']
})
export class RecipeEditComponent implements OnInit {

  id: number;
  editMode = false;
  recipeForm: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private recSrv: RecipeService) { }

  ngOnInit() {
    this.route.params
      .subscribe(
        (params: Params) => {
          this.id = +params['id'];
          this.editMode = params['id'] != null; // if we are in edit mode, the ID is present, otherwise not
          this.initForm();
        }
      );
  }

  private initForm() {
    let recipeName = '';
    let imagePath = '';
    let description = '';
    const ingredients = new FormArray([]);

    if (this.editMode) {
      const recipe = this.recSrv.getRecipe(this.id);
      recipeName = recipe.name;
      imagePath = recipe.imagePath;
      description = recipe.description;
      if (recipe['ingredients']) {
        for (const ing of recipe.ingredients) {
          ingredients.push(new FormGroup({
            'name': new FormControl(ing.name, Validators.required),
            'amount': new FormControl(ing.amount, [Validators.required, Validators.pattern(/^[1-9]+[0-9]*$/)])
          }));
        }
      }
    }
    this.recipeForm = new FormGroup({
      'name': new FormControl(recipeName, Validators.required),
      'imagePath': new FormControl(imagePath, Validators.required),
      'desc': new FormControl(description, Validators.required),
      'ingredients': ingredients
    });
  }

  onSubmit() {
    const newRecipe = new Recipe(
      this.recipeForm.value['name'],
      this.recipeForm.value['desc'],
      this.recipeForm.value['imagePath'],
      this.recipeForm.value['ingredients']
    );
    if (this.editMode) {
      this.recSrv.updateRecipe(this.id, newRecipe);
      // this.recSrv.updateRecipe(this.id, this.recipeForm.value);
      // cant do like the commented code above because I have different names (desc vs description)
    } else {
      this.recSrv.addRecipe(newRecipe);
      // this.recSrv.addRecipe(this.recipeForm.value);
    }
    // this.router.navigate(['recipes']);
    this.onCancel();
  }

  // helper
  getControls() {
    const ret = (<FormArray>this.recipeForm.get('ingredients')).controls;
    return ret;
  }

  onAddIngredient() {
    (<FormArray>this.recipeForm.get('ingredients')).push(
      new FormGroup({
        'name': new FormControl(null, Validators.required),
        'amount': new FormControl(null, [Validators.required, Validators.pattern(/^[1-9]+[0-9]*$/)])
      })
    );
  }

  onDeleteIngredient(index: number) {
    (<FormArray>this.recipeForm.get('ingredients')).removeAt(index);
    // this.recipeForm.patchValue
  }

  onCancel() {
    this.router.navigate(['../'], {relativeTo: this.route});
  }

}

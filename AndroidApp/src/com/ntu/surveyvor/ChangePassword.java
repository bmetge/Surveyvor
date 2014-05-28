package com.ntu.surveyvor;

import java.io.IOException;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.json.JSONException;
import org.json.JSONObject;
import org.json.JSONTokener;


import android.os.AsyncTask;
import android.os.Bundle;
import android.app.Activity;
import android.app.AlertDialog;
import android.app.ProgressDialog;
import android.content.DialogInterface;
import android.content.Intent;
import android.view.Menu;
import android.view.View;
import android.widget.CheckBox;
import android.widget.EditText;

public class ChangePassword extends Activity {
	
	private AlertDialog alertDialog;
	private ProgressDialog progressDialog;
	private AlertDialog successDialog;
	
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_change_password);
        alertDialog = new AlertDialog.Builder(this).create();
        progressDialog = new ProgressDialog(ChangePassword.this);
        AlertDialog.Builder builder = new AlertDialog.Builder(ChangePassword.this);
		// Add the buttons
		builder.setPositiveButton("OK", new DialogInterface.OnClickListener() {
		           public void onClick(DialogInterface dialog, int id) {
		               // User clicked OK button
		        	   Intent intent = new Intent(ChangePassword.this, Profile.class);
				       startActivity(intent);
		           }
		       });
		successDialog = builder.create();
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        getMenuInflater().inflate(R.menu.activity_change_password, menu);
        return true;
    }
    
    public void onClickConfirm(View v) {
    	ChangePasswordTask task = new ChangePasswordTask();
    	EditText oldPassword = (EditText) findViewById(R.id.editText1);
    	EditText newPassword = (EditText) findViewById(R.id.editText2);
    	EditText retypedNewPassword = (EditText) findViewById(R.id.editText3);


    	Pattern pattern = Pattern.compile("^(?=.*[0-9])(?=.*[A-Z]).{8,}$");
    	Matcher matcher = pattern.matcher(newPassword.getText().toString().toUpperCase());
    	
    	boolean passed = true; 
    	if (oldPassword.getText().toString().length()==0){
    		oldPassword.setError("Old password is required!");
    		passed = false;
    	}
    	if (newPassword.getText().toString().length()==0){
    		newPassword.setError("Password is required!");
    		passed = false;
    	}
    	else if( ! matcher.matches() ){
    		newPassword.setError("Password must be at least 8 characters long and must contain 1 letter and 1 number");
    		passed = false;
    	}
    	if (retypedNewPassword.getText().toString().length()==0){
    		retypedNewPassword.setError("Retyped Password required!");
    		passed = false;
    	}
    	else if( ! newPassword.getText().toString().equals(retypedNewPassword.getText().toString()) ){
    		retypedNewPassword.setError("Passwords do not match! Please check that you have retyped correctly.");
    		passed = false;
    	}

    	if( passed ){
    		task.execute("account/change_credentials/", "oldPassword="+oldPassword.getText().toString()+"&newPassword="+newPassword.getText().toString());
    	}

    }
   
    
    private class ChangePasswordTask extends AsyncTask<String, Void, String> {

    	@Override
    	protected String doInBackground(String... params) {
    		String relativeUrl = params[0];
    		String postQuery = params[1];
    		try {
    			return ServerComm.getJsonWithPost(relativeUrl, postQuery);
    		} catch (IOException e) {
    			// TODO Auto-generated catch block
    			e.printStackTrace();
    			return null;
    		}
    	}
    	
    	@Override
        protected void onPreExecute()
        {
            progressDialog.setMessage("Please wait...");
            progressDialog.show();
        }
    	
    	protected void onPostExecute(String jsonString) {
        	JSONObject object;
			try {
				object = (JSONObject) new JSONTokener(jsonString).nextValue();
			
				if(object.getBoolean("wrong_old_password")){
					alertDialog.setMessage("Old Password is wrong!");
					alertDialog.show();
				}
				else {
			        successDialog.setMessage("Success! Your password has been changed.");
					successDialog.show();
					
				}
			progressDialog.dismiss();
				
			} catch (JSONException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
        }

    }

}

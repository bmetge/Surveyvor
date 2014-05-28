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
import android.widget.EditText;

public class DeleteAccount extends Activity {
	private AlertDialog alertDialog;
	private ProgressDialog progressDialog;
	private AlertDialog successDialog;
	
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_delete_account);
        alertDialog = new AlertDialog.Builder(this).create();
        progressDialog = new ProgressDialog(DeleteAccount.this);
        AlertDialog.Builder builder = new AlertDialog.Builder(DeleteAccount.this);
		// Add the buttons
		builder.setPositiveButton("OK", new DialogInterface.OnClickListener() {
		           public void onClick(DialogInterface dialog, int id) {
		               // User clicked OK button
		        	   Intent intent = new Intent(DeleteAccount.this, LoginActivity.class);
				       startActivity(intent);
		           }
		       });
		successDialog = builder.create();
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        getMenuInflater().inflate(R.menu.activity_delete_account, menu);
        return true;
    }
    

    public void onClickConfirm(View v) {
    	DeleteAccountTask task = new DeleteAccountTask();
    	EditText password = (EditText) findViewById(R.id.editText1);
 
    	if (password.getText().toString().length()==0){
    		password.setError("Password is required!");
    	}
    	else 
    		task.execute("account/delete_account/", "confirmPassword="+password);


    }
   
    
    private class DeleteAccountTask extends AsyncTask<String, Void, String> {

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
        	alertDialog.setMessage(jsonString);
			alertDialog.show();
			try {
				object = (JSONObject) new JSONTokener(jsonString).nextValue();
			
				if(object.getBoolean("wrong_password")){
					alertDialog.setMessage("Password is wrong!");
					alertDialog.show();
				}
				else {
			        successDialog.setMessage("Your account has been deleted.");
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
